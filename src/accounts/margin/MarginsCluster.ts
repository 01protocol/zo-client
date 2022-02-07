import State from "../State";
import Margin from "./Margin";
import EventEmitter from "eventemitter3";
import { UpdateEvents } from "./UpdateEvents";
import { Program } from "@project-serum/anchor";
import { Zo } from "../../types/zo";
import { KeyedAccountInfo } from "@solana/web3.js";
import {
  DEFAULT_MARGINS_CLUSTER_CONFIG,
  MarginsClusterConfig,
  ZO_DEVNET_STATE_KEY,
  ZO_MAINNET_STATE_KEY,
} from "../../config";
import { Cluster } from "../../utils";

export default class MarginsCluster {
  margins: { [key: string]: Margin } = {};
  private controlToMarginKey: Map<string, string> = new Map();
  private marginListener = 0;
  private controlListener = 0;
  // @ts-ignore
  eventEmitter: EventEmitter<UpdateEvents, any> | null;
  // @ts-ignore
  state: State;

  constructor(
    public readonly program: Program<Zo>,
    public readonly cluster: Cluster,
    readonly config: MarginsClusterConfig = DEFAULT_MARGINS_CLUSTER_CONFIG,
  ) {}

  hardRefreshIntervalId: any;

  async launch() {
    this.eventEmitter = new EventEmitter<UpdateEvents>();
    this.state = await State.load(
      this.program,
      this.cluster == Cluster.Devnet
        ? ZO_DEVNET_STATE_KEY
        : ZO_MAINNET_STATE_KEY,
    );
    await this.state.subscribe({
      cacheRefreshInterval: this.config.cacheRefreshInterval,
      eventEmitter: this.eventEmitter,
    });
    const that = this;
    this.log("State loaded");
    await this.loadAccounts();
    this.log("MarginsCluster loaded");
    this.startMarginsListener();
    this.startControlsListener();
    this.hardRefreshIntervalId = setInterval(
      () => that.hardRefreshAccounts(),
      this.config.hardRefreshInterval,
    );
    this.log("MarginsCluster listeners launched");
    this.eventEmitter!.emit(UpdateEvents.marginsReloaded, null);
    this.log("MarginsCluster running");
  }

  async hardRefreshAccounts() {
    await this.program.provider.connection.removeProgramAccountChangeListener(
      this.controlListener,
    );
    await this.program.provider.connection.removeProgramAccountChangeListener(
      this.marginListener,
    );
    this.margins = {};
    this.controlToMarginKey = new Map();
    await this.loadAccounts();
    this.startMarginsListener();
    this.startControlsListener();
    this.eventEmitter!.emit(UpdateEvents.marginsReloaded, null);
    this.log("Hard refresh complete");
  }

  private async loadAccounts() {
    const rawMargins = await Margin.loadAllMargins(
      this.program,
      this.state,
      null,
      this.config.verbose,
      this.config.loadWithOrders,
    );
    this.margins = {};
    for (const rawMargin of rawMargins) {
      this.margins[rawMargin.pubkey.toString()] = rawMargin;
    }
    for (const margin of Object.values(this.margins)) {
      this.controlToMarginKey.set(
        margin.control.pubkey.toString(),
        margin.pubkey.toString(),
      );
    }
  }

  private startMarginsListener() {
    const that = this;
    this.marginListener =
      this.program.provider.connection.onProgramAccountChange(
        that.program.programId,
        async (account: KeyedAccountInfo) => {
          try {
            const accountInfo = account.accountInfo;
            const pubkey = account.accountId;
            if (that.margins[pubkey.toString()]) {
              await that.margins[pubkey.toString()]!.updateWithAccountInfo(
                accountInfo,
              );
            } else {
              that.margins[pubkey.toString()] =
                await Margin.loadFromAccountInfo(
                  that.program,
                  that.state,
                  accountInfo,
                  this.config.loadWithOrders,
                );
              that.controlToMarginKey.set(
                that.margins[pubkey.toString()]!.control.pubkey.toString(),
                that.margins[pubkey.toString()]!.pubkey.toString(),
              );
            }
            that.eventEmitter!.emit(
              UpdateEvents.marginModified,
              pubkey.toString(),
            );
          } catch (_) {
            console.warn("Failed to load an updated margin account!");
          }
        },
        "confirmed",
        [{ dataSize: that.program.account["margin"].size }],
      );
  }

  private startControlsListener() {
    const that = this;
    this.controlListener =
      this.program.provider.connection.onProgramAccountChange(
        that.program.programId,
        async (account: KeyedAccountInfo) => {
          try {
            const accountInfo = account.accountInfo;
            const pubkey = account.accountId;
            const marginKey = that.controlToMarginKey.get(pubkey.toString());
            if (marginKey) {
              await that.margins[marginKey]!.updateControlFromAccountInfo(
                accountInfo,
              );
              that.eventEmitter!.emit(UpdateEvents.controlModified, marginKey);
            }
          } catch (_) {
            console.warn("Failed to load an updated control account!");
          }
        },
        "confirmed",
        [{ dataSize: that.program.account["control"].size }],
      );
  }

  async kill() {
    clearInterval(this.hardRefreshIntervalId);
    await this.state.unsubscribe();
    await this.program.provider.connection.removeProgramAccountChangeListener(
      this.controlListener,
    );
    await this.program.provider.connection.removeProgramAccountChangeListener(
      this.marginListener,
    );
    this.eventEmitter?.removeAllListeners();
    this.eventEmitter = null;
    this.log("MarginManager killed");
  }

  /**
   * Log a message to the console if verbose is enabled
   * @param msg
   * @private
   */
  private log(...msg) {
    if (this.config.verbose) {
      console.log(...msg);
    }
  }
}

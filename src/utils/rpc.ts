import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";

export async function getFilteredProgramAccounts(
  connection: Connection,
  programId: PublicKey,
  filters: any,
): Promise<{ publicKey: PublicKey; accountInfo: AccountInfo<Buffer> }[]> {
  // @ts-ignore
  const resp = await connection._rpcRequest("getProgramAccounts", [
    programId.toBase58(),
    {
      commitment: connection.commitment,
      filters,
      encoding: "base64",
    },
  ]);
  if (resp.error) {
    throw new Error(resp.error.message);
  }
  // @ts-ignore
  return resp.result.map(
    ({ pubkey, account: { data, executable, owner, lamports } }) => ({
      publicKey: new PublicKey(pubkey),
      accountInfo: {
        data: Buffer.from(data[0], "base64"),
        executable,
        owner: new PublicKey(owner),
        lamports,
      },
    }),
  );
}

export async function getEpoch(connection: Connection) {
  // @ts-ignore
  const resp = await connection._rpcRequest("getEpochInfo", [
    {
      commitment: "finalized",
    },
  ]);
  if (resp.error) {
    throw new Error(resp.error.message);
  }
  return resp.result;
}

export async function getCurrentSlot(connection: Connection) {
  const res = await getEpoch(connection);
  return res.absoluteSlot;
}

export async function getSignaturesForAddress(
  connection: Connection,
  address: PublicKey,
) {
  // @ts-ignore
  const resp = await connection._rpcRequest("getSignaturesForAddress", [
    address.toBase58(),
    {
      commitment: "finalized",
    },
  ]);
  if (resp.error) {
    throw new Error(resp.error.message);
  }
  return resp.result;
}

export async function getSignaturesForAddressRecent(
  connection: Connection,
  address: PublicKey,
) {
  // @ts-ignore
  const resp = await connection._rpcRequest("getSignaturesForAddress", [
    address.toBase58(),
    {
      commitment: "recent",
    },
  ]);
  if (resp.error) {
    throw new Error(resp.error.message);
  }
  return resp.result;
}

export async function getTransaction(
  connection: Connection,
  transaction: string,
) {
  // @ts-ignore
  const resp = await connection._rpcRequest("getTransaction", [
    transaction,
    {
      commitment: "finalized",
      encoding: "base64",
    },
  ]);
  if (resp.error) {
    throw new Error(resp.error.message);
  }
  return resp.result;
}

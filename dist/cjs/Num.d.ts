import BN from "bn.js";
import Decimal from "decimal.js";
export default class Num {
    readonly decimals: number;
    readonly n: Readonly<BN>;
    private precisionDecimals;
    constructor(n: BN | Decimal | number, decimals: number);
    _float: number | null;
    get float(): number;
    _dec: Decimal | null;
    get dec(): Decimal;
    get decimal(): Decimal;
    get number(): number;
    /** Returns the number in smol Decimal (i.e. smallest units). */
    get smolDecimal(): Decimal;
    static fromWI80F48(data: {
        data: BN;
    }, decimals: number): Num;
    toString(): string;
}

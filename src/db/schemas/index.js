import {AppSchema} from './app';
import {UserSchema} from './user';
import {DepositSchema} from './deposit';
import {GameSchema} from './game';
import {BetSchema} from './bet';
import {AdminSchema} from './admin';
import {ResultSpaceSchema} from './resultSpace';
import {WithdrawSchema} from './withdraw';
import {BetResultSpaceSchema} from './betResultSpace';
import { WalletSchema } from './wallet';
import { SecuritySchema } from './security';
import { AffiliateStructureSchema } from './affiliateStructure';
import { CurrencySchema } from './currency';
import { MailSenderSchema } from './integrations/mailSender';
import { IntegrationsSchema } from "./integrations";
import { ChatSchema } from './integrations/chat';
import { PermissionSchema } from "./permission";
import { AddOnSchema } from "./addOn";
import { AutoWithdrawSchema } from "./addOn/autoWithdraw";
import { TxFeeSchema } from "./addOn/txFee";
import { BalanceSchema } from "./addOn/balance";
import { DepositBonusSchema } from "./addOn/depositBonus";
import { FreeCurrencySchema } from "./addOn/freeCurrency";
import { JackpotSchema } from "./addOn/jackpot";
import { PointSystemSchema } from "./addOn/pointSystem";

export {
    PointSystemSchema,
    JackpotSchema,
    FreeCurrencySchema,
    DepositBonusSchema,
    BalanceSchema,
    TxFeeSchema,
    UserSchema,
    AppSchema,
    WalletSchema,
    SecuritySchema,
    CurrencySchema,
    AffiliateStructureSchema,
    DepositSchema,
    GameSchema,
    BetSchema,
    BetResultSpaceSchema,
    WithdrawSchema,
    AdminSchema,
    ResultSpaceSchema,
    MailSenderSchema,
    IntegrationsSchema,
    ChatSchema,
    PermissionSchema,
    AddOnSchema,
    AutoWithdrawSchema
}
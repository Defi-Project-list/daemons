import { BigNumber } from 'ethers';
import { IMaxRepetitionsCondition } from '../../../../shared-definitions/scripts/condition-messages';
import { IRepetitionsConditionForm } from '../../components/new-script-page/blocks/conditions/conditions-interfaces';


export class RepetitionsConditionFactory {

    /** A disabled repetitions condition */
    public static empty = (): IMaxRepetitionsCondition => ({
        enabled: false,
        amount: BigNumber.from(0),
    });

    /** A repetitions condition built from json (rebuilding serialized objects) */
    public static fromJson = (repetitionsJson?: any): IMaxRepetitionsCondition => (
        repetitionsJson
            ? {
                enabled: repetitionsJson.enabled,
                amount: BigNumber.from(repetitionsJson.amount),
            }
            : this.empty());

    /** A repetitions condition built from user inputs */
    public static fromForm = (form: IRepetitionsConditionForm): IMaxRepetitionsCondition => {
        if (!form.enabled) return this.empty();

        return {
            enabled: true,
            amount: BigNumber.from(Math.min(form.amount, 4294967295)) // truncate to uint32
        };
    };
}

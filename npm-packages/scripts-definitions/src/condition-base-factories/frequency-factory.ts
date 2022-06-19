import { BigNumber } from "ethers";
import { IFrequencyCondition } from "@daemons-fi/shared-definitions";

export class FrequencyFactory {
    /** A disabled frequency condition */
    public static empty = (): IFrequencyCondition => ({
        enabled: false,
        delay: BigNumber.from(0),
        start: BigNumber.from(0)
    });

    /** A frequency condition built from json (rebuilding serialized objects) */
    public static fromJson = (frequencyJson?: any): IFrequencyCondition =>
        frequencyJson
            ? {
                  enabled: frequencyJson.enabled,
                  delay: BigNumber.from(frequencyJson.delay),
                  start: BigNumber.from(frequencyJson.start)
              }
            : FrequencyFactory.empty();
}

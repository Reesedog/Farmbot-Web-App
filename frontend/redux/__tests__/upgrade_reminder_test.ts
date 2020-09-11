import { info } from "../../toast/toast";

describe("createReminderFn", () => {
  it("reminds the user as-needed, but never more than once", async () => {
    jest.resetAllMocks();
    expect(globalConfig).toBeDefined();
    const old = globalConfig.FBOS_END_OF_LIFE_VERSION;
    globalConfig.FBOS_END_OF_LIFE_VERSION = "6.3.1";

    const { createReminderFn } = await import("../upgrade_reminder");
    const ding = createReminderFn();
    expect(info).toHaveBeenCalledTimes(0);

    ding("6.3.2");
    expect(info).toHaveBeenCalledTimes(0);

    ding("6.3.1");
    expect(info).toHaveBeenCalledTimes(0);

    ding("6.3.0");
    expect(info).toHaveBeenCalledTimes(1);

    ding("6.3.0");
    expect(info).toHaveBeenCalledTimes(1);

    ding("1.3.0");
    expect(info).toHaveBeenCalledTimes(2);
    globalConfig.FBOS_END_OF_LIFE_VERSION = old;
  });
});

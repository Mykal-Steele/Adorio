import { shelfItems } from "./data";

describe("home shelf data", () => {
  it("includes Social card in web shelf with route", () => {
    const socialCard = shelfItems.web.find((item) => item.title === "Social");

    expect(socialCard).toBeDefined();
    expect(socialCard.href).toBe("https://social.adorio.space/");
    expect(typeof socialCard.image).toBe("string");
  });
});

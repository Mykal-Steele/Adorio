import { render, screen } from "@testing-library/react";
import CarouselCard from "./CarouselCard";

describe("CarouselCard", () => {
  const baseCard = {
    title: "Social",
    subtitle: "Community Feed",
    image: "https://example.com/social.png",
    price: "Live",
    rating: 5.0,
    badge: "New",
  };

  it("renders card content", () => {
    render(<CarouselCard card={baseCard} />);

    expect(screen.getByRole("img", { name: "Social" })).toBeInTheDocument();
    expect(screen.getByText("Community Feed")).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("renders a navigable link when href is provided", () => {
    render(
      <CarouselCard
        card={{ ...baseCard, href: "https://social.adorio.space/" }}
      />,
    );

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://social.adorio.space/",
    );
  });

  it("does not render a link when href is missing", () => {
    render(<CarouselCard card={baseCard} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

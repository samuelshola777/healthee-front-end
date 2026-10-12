export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
}

export const products: Product[] = [
  {
    id: "orange",
    name: "Orange",
    category: "CITRUS",
    description: "A bright citrus moment.",
    image: "/assets/orange.png",
  },
  {
    id: "watermelon",
    name: "Watermelon",
    category: "REFRESHING",
    description: "A splash of summer colour.",
    image: "/assets/watermelon.png",
  },
  {
    id: "pineapple",
    name: "Pineapple",
    category: "TROPICAL",
    description: "Your tropical interlude.",
    image: "/assets/pineapple.png",
  },
  {
    id: "zobo",
    name: "Zobo",
    category: "HIBISCUS",
    description: "Rich colour. Distinct character.",
    image: "/assets/zobo.png",
  },
  {
    id: "tigernut",
    name: "Tigernut",
    category: "DISTINCTIVE",
    description: "Something a little different.",
    image: "/assets/tigernut.png",
  },
];

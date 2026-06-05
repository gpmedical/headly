export const fontFamilies = {
  regular: "Poppins-Regular",
  medium: "Poppins-Medium",
  semiBold: "Poppins-SemiBold",
  native: "Poppins",
} as const;

export const fontAssets = {
  regular: require("../../assets/fonts/Poppins-Regular.ttf"),
  medium: require("../../assets/fonts/Poppins-Medium.ttf"),
  semiBold: require("../../assets/fonts/Poppins-SemiBold.ttf"),
} as const;

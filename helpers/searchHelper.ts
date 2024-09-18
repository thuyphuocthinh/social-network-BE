export const searchHelper = (keyword: string): RegExp => {
  const regex = new RegExp(keyword, "i");
  return regex;
};

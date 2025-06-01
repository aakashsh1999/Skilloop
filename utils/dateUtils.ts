export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
  };

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
  } catch (error) {
    return dateString;
  }
};

export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "";

  const [year, month] = dateString.split("-");
  return `${month}/${year}`;
};

export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return "";

  // For MM/YYYY format to YYYY-MM format
  if (dateString.includes("/")) {
    const [month, year] = dateString.split("/");
    return `${year}-${month}`;
  }

  return dateString;
};

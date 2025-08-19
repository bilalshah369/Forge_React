// Utility function to format amounts
export const formatAmountWithoutDollarSign = (amount) => {
  // Ensure the amount is a valid number
  debugger;
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "$"; // Default value for invalid amounts, no decimals
  }

  // Convert the amount to a number (if it's a string)
  const parsedAmount =
    typeof amount === "string"
      ? parseFloat(amount.replace(/[^0-9.-]/g, ""))
      : Number(amount);

  // Check if the parsed amount is a valid number
  if (isNaN(parsedAmount)) {
    return "$"; // Default value for invalid amounts
  }

  // Format the amount with commas and a dollar sign, without decimals
  return parsedAmount.toLocaleString("en-US", {
    //style: 'currency',
    //currency: 'USD',
    minimumFractionDigits: 0, // Remove decimal places
    maximumFractionDigits: 0, // Remove decimal places
  });
};

export const formatAmountWithDollarSign = (amount) => {
  debugger;
  // Ensure the amount is a valid number
  amount=amount?.toString()
  amount=amount.replace(',');
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "$"; // Default value for invalid amounts, no decimals
  }

  // Convert the amount to a number (if it's a string)
  const parsedAmount =
    typeof amount === "string"
      ? parseFloat(amount.replace(/[^0-9.-]/g, ""))
      : Number(amount);

  // Check if the parsed amount is a valid number
  if (isNaN(parsedAmount)) {
    return "$"; // Default value for invalid amounts
  }

  // Format the amount with commas and a dollar sign, without decimals
  return parsedAmount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0, // Remove decimal places
    maximumFractionDigits: 0, // Remove decimal places
  });
};
export const convertUTCtoLocalDateOnly = (dateInput) => {
  if (!dateInput) return null;

  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  return new Date(year, month, day); // Local midnight
};

export const hasPermission = (permissions, permissionName) => {
  return permissions.some((p) => p.permission_name === permissionName);
};

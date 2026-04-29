const ALLOWED_DOMAINS = ["@magicboxsolution.com", "@magicboxasia.com", "@launchpad.co.th", "@magicbox.digital"];
const ALLOWED_SPECIFIC_EMAILS = [
  "guest@example.com", // Replace with your allowed email 1
  "tester@gmail.com"   // Replace with your allowed email 2
];

export const isEmailAllowed = (email: string): boolean => {
  const lowerEmail = email.toLowerCase();

  // Check if it ends with an allowed domain
  const hasAllowedDomain = ALLOWED_DOMAINS.some(domain => lowerEmail.endsWith(domain));

  // Check if it's one of the specific allowed emails
  const isSpecificAllowed = ALLOWED_SPECIFIC_EMAILS.includes(lowerEmail);

  return hasAllowedDomain || isSpecificAllowed;
};

export const AUTH_ERROR_MESSAGE = "Please use your company email address to access the marketplace.";

const DefaultAvatar = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#E5E7EB"/>
    <path d="M20 10C22.21 10 24 11.79 24 14C24 16.21 22.21 18 20 18C17.79 18 16 16.21 16 14C16 11.79 17.79 10 20 10ZM20 24C24.42 24 29 26.28 29 28V30H11V28C11 26.28 15.58 24 20 24Z" fill="#9CA3AF"/>
  </svg>
);

// Data URL version of the avatar for direct use in img src
export const defaultAvatarUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI0U1RTdFQiIvPjxwYXRoIGQ9Ik0yMCAxMEMyMi4yMSAxMCAyNCAxMS43OSAyNCAxNEMyNCAxNi4yMSAyMi4yMSAxOCAyMCAxOEMxNy43OSAxOCAxNiAxNi4yMSAxNiAxNEMxNiAxMS43OSAxNy43OSAxMCAyMCAxMFpNMjAgMjRDMjQuNDIgMjQgMjkgMjYuMjggMjkgMjhWMzBIMTFWMjhDMTEgMjYuMjggMTUuNTggMjQgMjAgMjRaIiBmaWxsPSIjOUNBM0FGIi8+PC9zdmc+";

export default DefaultAvatar; 
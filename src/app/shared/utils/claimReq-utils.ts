export const claimReq = {
    admin: (c: any) => c.role == "Admin",
    adminOrManager: (c: any) => c.role == "Admin" || c.role == "Manager",
  }
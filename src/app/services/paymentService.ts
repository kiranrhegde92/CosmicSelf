export const paymentService = {
  async startCheckout(planId: string): Promise<{ ok: boolean; planId: string }> {
    await new Promise((res) => setTimeout(res, 600));
    return { ok: true, planId };
  },
};

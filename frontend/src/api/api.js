import { flaskApi } from '../services/flaskApi';


export const portfolioService = {
  /**
   * Fetch stock data (uses backend cache; refresh optional)
   * GET /portfolio/fetch-data
   */
  fetchStockData: (refresh = false) =>
    flaskApi.get('/portfolio/fetch-data', { params: { refresh } }),

  /**
   * Optimize portfolio
   * POST /portfolio/optimize
   */
  optimizePortfolio: (risk, amount, time, num_assets) =>
    flaskApi.post('/portfolio/optimize', {
      risk,
      amount,
      time,
      num_assets
    }),

  /**
   * Get stock info
   * POST /portfolio/info
   */
  getStockInfo: (tickers) =>
    flaskApi.post('/portfolio/info', { tickers }),

  /**
   * Simulate portfolio
   * POST /portfolio/monte-carlo
   */
  simulatePortfolio: (risk, amount, time, num_assets) =>
    flaskApi.post('/portfolio/monte-carlo', {
      risk,
      amount,
      time,
      num_assets
    }),
    /**
     * Get table data
     * POST /portfolio/table-data
     */
    getTableData: (weights, amount, time) =>
      flaskApi.post('/portfolio/table-data', {
        weights,
        amount,
        time
      }),
};

export { flaskApi };

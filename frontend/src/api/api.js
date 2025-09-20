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
   * Optimize portfolio using classical method
   * POST /portfolio/classical
   */
  optimizeClassicalPortfolio: (risk, amount, time, num_assets) =>
    flaskApi.post('/portfolio/classical', {
      risk,
      amount,
      time,
      num_assets
    }),


    /**
   * Compare quantum and classical portfolio optimization
   * POST /portfolio/comparison
   */
  comparePortfolios: (risk, amount, time, num_assets) =>
    flaskApi.post('/portfolio/comparison', {
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
  simulatePortfolio: (weights, amount, time) =>
    flaskApi.post('/portfolio/monte-carlo', {
      weights,
      amount,
      time
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

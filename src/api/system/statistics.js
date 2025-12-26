import request from "@/utils/request";

const STATISTICS_BASE_URL = "/api/v1/statistics";

const StatisticsAPI = {
  /** 获取访问趋势统计 */
  getVisitTrend(queryParams) {
    return request({
      url: `${STATISTICS_BASE_URL}/visits/trend`,
      method: "get",
      params: queryParams,
    });
  },
  /** 获取访问概览统计 */
  getVisitOverview() {
    return request({
      url: `${STATISTICS_BASE_URL}/visits/overview`,
      method: "get",
    });
  },
};

export default StatisticsAPI;

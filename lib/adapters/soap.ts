import { createMockAdapter } from "./mock";

export const soapAdapter = createMockAdapter({
  protocol: "SOAP",
  minDelayMs: 300,
  maxDelayMs: 2000,
  successRate: 0.85,
  steps: [
    { level: "DEBUG", message: "WSDL 조회", atProgress: 0.1 },
    { level: "INFO", message: "SOAP Envelope 생성", atProgress: 0.3 },
    { level: "INFO", message: "요청 전송", atProgress: 0.55 },
    { level: "DEBUG", message: "응답 파싱", atProgress: 0.8 },
    { level: "INFO", message: "결과 검증", atProgress: 0.95 },
  ],
  errorMessages: [
    "Envelope 파싱 실패",
    "WSDL 응답 없음",
    "SOAP Fault 수신",
  ],
  sampleRequest: {
    envelope:
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetData/></soap:Body></soap:Envelope>',
    action: "urn:GetData",
  },
  sampleResponse: {
    status: 200,
    body: "<soap:Envelope><soap:Body><GetDataResponse><result>OK</result></GetDataResponse></soap:Body></soap:Envelope>",
  },
});

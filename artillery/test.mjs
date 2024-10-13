import fs from 'fs';

const generateYAML = () => {
  const requests = [];

  // 베스트셀러 요청 생성
  for (let i = 1; i <= 100; i++) {
    requests.push(`      - get:\n          url: '/api/v1/books/bestsellers'\n          qs: { page: ${i}, limit: 15 }`);
  }

  // 신규 도서 요청 생성 (1부터 100까지)
  for (let i = 1; i <= 100; i++) {
    requests.push(`      - get:\n          url: '/api/v1/books/new-books'\n          qs: { page: ${i}, limit: 15 }`);
  }

  // 추천 도서 요청 (eBook 카테고리)
  for (let i = 1; i <= 100; i++) {
    requests.push(`      - get:\n          url: '/api/v1/books/recommended-books'\n          qs: { page: ${i}, limit: 4, category: 'eBook' }`);
  }

  // 추천 도서 요청 (일반 카테고리)
  for (let i = 1; i <= 100; i++) {
    requests.push(`      - get:\n          url: '/api/v1/books/recommended-books'\n          qs: { page: ${i}, limit: 4, category: 'book' }`);
  }

  const yamlContent = `config:\n  target: 'http://127.0.0.1:3095'\n  phases:\n    - duration: 20\n      arrivalRate: 50\n\nscenarios:\n  - flow:\n${requests.join('\n')}`;

  // YAML 파일 저장
  fs.writeFileSync('test.yml', yamlContent);
};

// 함수 실행
generateYAML();

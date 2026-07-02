# 검색 색인 제출 주소 정리

최종 정리일: 2026-07-01

## 제출 원칙

- 대표 도메인은 `https://sosotime.com`만 사용합니다.
- `http://`, `www`, `127.0.0.1`, `localhost` 주소는 제출하지 않습니다.
- `?category=`, `?rank=`, `?q=`가 붙은 필터/검색 URL은 중복 색인을 만들 수 있으므로 제출하지 않습니다.
- 가장 먼저 sitemap을 제출하고, 그다음 홈과 주요 글만 URL 검사로 요청합니다.

## 우선 제출

```text
https://sosotime.com/sitemap.xml
https://sosotime.com/robots.txt
https://sosotime.com/
```

## 기본 페이지

```text
https://sosotime.com/
https://sosotime.com/about
https://sosotime.com/contact
https://sosotime.com/policy/editorial
https://sosotime.com/policy/privacy
https://sosotime.com/policy/terms
```

## 일일 베스트 10

```text
https://sosotime.com/posts/퇴근길-지하철에서-모두가-조용해진-순간/
https://sosotime.com/posts/마트-계산대-앞에서-생긴-작은-오해/
https://sosotime.com/posts/질문-글이-답변을-많이-받는-방식/
https://sosotime.com/posts/사진-한-장이-설명보다-빠르게-퍼지는-이유/
https://sosotime.com/posts/배달-도착-알림-하나로-하루-기분이-바뀌는-이유/
https://sosotime.com/posts/편의점-앞에서-생긴-작은-착각/
https://sosotime.com/posts/직장-탕비실에서-입장이-갈리는-사소한-기준/
https://sosotime.com/posts/중고거래-약속-장소를-고를-때-확인할-것/
https://sosotime.com/posts/긴-제목이-클릭을-부르는-때와-피로하게-만드는-때/
https://sosotime.com/posts/저녁-게시판에-농담-글이-몰리는-이유/
```

## 주간 베스트 10

```text
https://sosotime.com/posts/사소한-인증-글이-오래-회자되는-조건/
https://sosotime.com/posts/버스에서-들린-소리에-사람들이-보인-반응/
https://sosotime.com/posts/베스트-글에서-반복되는-공통-구조/
https://sosotime.com/posts/동네-식당-후기에서-사람들이-먼저-보는-정보/
https://sosotime.com/posts/반려동물-사진-글을-과하게-설명하지-않아도-되는-이유/
https://sosotime.com/posts/커뮤니티-농담이-오해를-부르는-순간/
https://sosotime.com/posts/온라인-사과문이-받아들여지지-않는-이유/
https://sosotime.com/posts/출근-준비-시간이-늘-부족한-사람들의-공통점/
https://sosotime.com/posts/링크만-던져진-글보다-한눈에-보이는-글이-편한-이유/
https://sosotime.com/posts/가벼운-농담-글이-댓글을-많이-받는-이유/
```

## 제출 순서

1. Google Search Console에서 `https://sosotime.com/sitemap.xml` 제출
2. URL 검사에서 `https://sosotime.com/` 색인 생성 요청
3. 일일 베스트 1~3번 글만 먼저 URL 검사로 요청
4. Naver Search Advisor에서 사이트 등록 후 sitemap과 robots 확인
5. 네이버 웹 페이지 수집 요청에는 홈, 일일 베스트 1~3번, 주간 베스트 1번부터 제출

## 배포 후 확인 주소

```text
https://sosotime.com/
https://sosotime.com/sitemap.xml
https://sosotime.com/robots.txt
```

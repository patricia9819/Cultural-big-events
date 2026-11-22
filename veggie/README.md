# 🥬 我的素食地圖

把 Google 地圖上的素食清單（含每個地點的備註）變成可以搜尋、分類的清單＋地圖，並自動同步。

## 設定步驟（只要做一次）

1. **分享 Google 地圖清單**：Google 地圖 App →「你的地點 / 已儲存」→ 點清單右邊 ⋯ →「分享清單」→ 複製連結（`https://maps.app.goo.gl/...`）。
   清單要設成「已分享」才能讀取，不需要公開到搜尋引擎。
2. **貼到 `veggie/lists.json`**：把連結貼到 `url`。有多個清單（例如「台北素食」「台中素食」）就加多行：
   ```json
   { "lists": [
     { "name": "台北素食", "url": "https://maps.app.goo.gl/AAAA" },
     { "name": "台中素食", "url": "https://maps.app.goo.gl/BBBB" }
   ] }
   ```
3. **開啟 GitHub Pages**：repo → Settings → Pages → Source 選 `main` 分支 → 網址是 `https://<帳號>.github.io/Cultural-big-events/veggie/`。
4. **確認 Actions 有寫入權限**：Settings → Actions → General → Workflow permissions 選「Read and write permissions」。

## 同步方式

- `.github/workflows/sync-veggie.yml` 每 3 小時自動抓一次清單，有變動才更新 `veggie/places.json`。
- 想馬上同步：GitHub → Actions →「同步 Google 地圖素食清單」→ Run workflow。
- 在 Google 地圖新增地點或修改備註，下次同步時這邊就會跟著更新；刪除也會同步移除。

## 備註自動分類

頁面會依備註文字自動加上標籤，可以點選篩選：全素/純素、蛋奶素、可去五辛、含五辛、有素食選項。
想加新的關鍵字或標籤，修改 `veggie/index.html` 裡的 `TAG_RULES`。

## 限制

Google 沒有提供讀取「已儲存清單」的官方 API，同步用的是 Google 地圖網頁本身讀取分享清單的方式。
若 Google 改版造成抓取失敗，頁面會保留上一次的資料並顯示提示，需要再調整 `scripts/sync_google_lists.py`。

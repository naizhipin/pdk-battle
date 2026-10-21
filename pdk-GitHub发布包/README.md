# pdk水友战

这是观众只读版本。名单和赛果来自仓库根目录的 `tournament.json`，没有数据库，没有账号密码或付费服务。

## 第一次上线

1. 解压发布包。将 `index.html`、`style.css`、`app.js`、`tournament.json`、`.nojekyll` 和本说明上传到 `naizhipin/pdk-battle` 仓库根目录。不要把压缩包本身上传，也不要再套一层文件夹。
2. 在仓库的 Settings → Pages 中，Source 选择 Deploy from a branch。
3. 选择上传文件所在分支（通常是 main），目录选择 /(root)，点击 Save。
4. 等 GitHub 显示发布完成后，打开 https://naizhipin.github.io/pdk-battle/ 。此地址是预期地址，首次部署前不可用。

## 每次更新名单

1. 在自己的电脑双击单独提供的 `pdk-本地管理器.html`，保留所有随机分组、队伍编辑和赛果编辑功能。
2. 如果换电脑或浏览器，先导入上次发布的 `tournament.json`。浏览器草稿不会跨设备同步。
3. 编辑后点击“导出发布名单”，下载 `tournament.json`。浏览器可能把重复下载命名为 `tournament (1).json`，上传前请恢复名称为 `tournament.json`。
4. 在 GitHub 仓库点击 Add file → Upload files，上传该文件到根目录，覆盖旧的同名文件，然后 Commit changes。
5. 等待 Pages 发布完成，观众刷新即可看到修改；页面也会每分钟尝试读取一次最新名单。

“保存队伍”只保存本地草稿；“导出发布名单”只下载文件。只有上传并提交到 GitHub、完成 Pages 部署后，观众才能看到更新。

## 权限

观众网页没有编辑入口，也不读取观众浏览器中的草稿。只有有仓库写权限的 GitHub 账号才能发布共享数据；若希望仅自己发布，不要给其他人仓库写权限。

本地管理器是离线编辑工具，不是登录验证页面，也没有自动上传权限。不必把它上传到公开仓库。即使别人获得管理器，也无法更改你仓库里的名单。

公开仓库的内容和历史均可被查看，请仅填写供观众查看的游戏昵称。

GitHub 官方配置文档：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

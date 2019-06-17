// 使用 RSSHub 提供的 puppeteer 工具类，初始化 Chrome 进程
const browser = await require('@/utils/puppeteer')();
// 创建一个新的浏览器页面
const page = await browser.newPage();
// 访问指定的链接
const link = 'http://physics.scu.edu.cn/';
await page.goto(link);
// 渲染目标网页
const html = await page.evaluate(
    () =>
        // 选取渲染后的 HTML
        document.querySelector('div.new-series-wrapper').innerHTML
);
// 关闭浏览器进程
browser.close();
const $ = cheerio.load(html); // 使用 cheerio 加载返回的 HTML
const list = $('div.item'); 
ctx.state.data = {
    title: '少数派 -- 最新上架付费专栏',
    link,
    description: '少数派 -- 最新上架付费专栏',
    item: list
        .map((i, item) => ({
            // 文章标题
            title: $(item)
                .find('.item-title a')
                .text()
                .trim(),
            // 文章链接
            link: url.resolve(
                link,
                $(item)
                    .find('.item-title a')
                    .attr('href')
            ),
            // 文章作者
            author: $(item)
                .find('.item-author')
                .text()
                .trim(),
        }))
        .get(), // cheerio get() 方法将 cheerio node 对象数组转换为 node 对象数组
};
const description = await ctx.cache.tryGet(link, async () => {
    const result = await got.get(link);

    const $ = cheerio.load(result.data);
    $('img').each(function(i, e) {
        $(e).attr('src', $(e).attr('data-src'));
    });

    return $('.article-holder').html();
});
ctx.state.data = {
    title: '', // 项目的标题
    link: '', // 指向项目的链接
    description: '', // 描述项目
    language: '', // 频道语言
    item: [
        // 其中一篇文章或一项内容
        {
            title: '', // 文章标题
            author: '', // 文章作者
            category: '', // 文章分类
            // category: [''], // 多个分类
            description: '', // 文章摘要或全文
            pubDate: '', // 文章发布时间
            guid: '', // 文章唯一标示, 必须唯一, 可选, 默认为文章链接
            link: '', // 指向文章的链接
        },
    ],
};

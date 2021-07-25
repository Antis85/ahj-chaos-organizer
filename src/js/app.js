import WidgetTimeLine from './widgetTimeLine';

// temp plug
const initialPosts = [];
for (let i = 1; i < 30; i += 1) {
  initialPosts.push(
    `<div class="post_content" data-id="postContent" data-counter="${i}">
      <span>26.07.2021 00:40:41</span>
      <div class="content">${i}</div>
      <div class="hidden"></div>
      <div class="post_footer_bar">
        <div class="coordinates">[56.2364416, 43.4372608] &#128065;</div>
        <div class="pin_icon hidden">📌</div>
        <div class="fav_icon hidden">☆</div>
      </div>
    </div>`,
  );
}

const widgetTimeLine = new WidgetTimeLine(initialPosts);
widgetTimeLine.init();

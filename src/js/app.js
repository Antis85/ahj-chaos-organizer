import WidgetTimeLine from './widgetTimeLine';

// temp plug
const initialPosts = [];
for (let i = 1; i < 50; i += 1) {
  initialPosts.push(
    `<div class="post_content" data-id="postContent" data-counter="${i}">
        <span>18.07.2021 18:48:56</span>
        <div>${i}</div>
        <span>[56.2364416, 43.4372608] &#128065;</span>
      </div>`,
  );
}

const widgetTimeLine = new WidgetTimeLine(initialPosts);
widgetTimeLine.init();

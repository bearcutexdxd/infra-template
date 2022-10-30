const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function createComment() {
  try {
    const { OAUTH, RELEASE, ORG_ID } = process.env;

    const response = await fetch(`https://api.tracker.yandex.net/v2/issues/HOMEWORKSHRI-182/comments`, {
      method: "POST",
      headers: {
        Authorization: `OAuth ${OAUTH}`,
        "X-Org-ID": ORG_ID,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: `Собрали образ в тегом ${RELEASE}` })
    })

    if (response.ok) {
      console.log('comment created');
    }
  } catch (error) {
    console.log(error);
  }
}

createComment();
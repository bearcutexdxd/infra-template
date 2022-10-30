const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function getAllTags() {
  try {
    const response = await fetch('https://api.github.com/repos/bearcutexdxd/infra-template/git/refs/tags');
    if (response.ok) {
      const data = await response.json();
      if (data.length < 2) {
        return { lastTag: '', tagBeforeLast: '' };
      } else {
        const regex = /rc-0.0.[0-9]+/;
        let lastTag = regex.exec(data.pop().ref)[0];
        let tagBeforeLast = regex.exec(data.pop().ref)[0];

        return { lastTag, tagBeforeLast };
      }
    }
    else {
      return { lastTag: '', tagBeforeLast: '' };
    }
  } catch (error) {
    console.log(error);
  }
}


async function getAllCommits() {
  try {
    const { lastTag, tagBeforeLast } = await getAllTags();

    if (lastTag && tagBeforeLast) {
      const response = await fetch(`https://api.github.com/repos/bearcutexdxd/infra-template/compare/${tagBeforeLast}...${lastTag}`);
      if (response.ok) {
        const data = await response.json();
        const commits = data.commits.map((el) => {
          return `${el.sha} ${el.commit.author.name} ${el.commit.message}`;
        }).join('\n');

        return commits;
      }
    } else {
      const response = await fetch('https://api.github.com/repos/bearcutexdxd/infra-template/commits');
      if (response.ok) {
        const data = await response.json();
        const commits = data.map((el) => {
          return `${el.sha} ${el.commit.author.name} ${el.commit.message}`;
        }).join('\n');

        return commits;
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function updateTicket() {
  try {
    const { OAUTH, ACTOR, RELEASE, ORG_ID } = process.env;
    const commits = await getAllCommits();
    const date = new Date().toLocaleDateString();
    const summary = `Релиз ${RELEASE} - ${date}`;
    const description = `Ответственный за релиз: ${ACTOR}\n\nКоммиты, попавшие в релиз:\n${commits}`;

    const response = await fetch(`https://api.tracker.yandex.net/v2/issues/HOMEWORKSHRI-182`, {
      method: "PATCH",
      headers: {
        Authorization: `OAuth ${OAUTH}`,
        "X-Org-ID": ORG_ID,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ summary, description })
    })

    if (response.ok) {
      console.log('ticket updated');
    }
  } catch (error) {
    console.log(error);
  }
}

updateTicket();
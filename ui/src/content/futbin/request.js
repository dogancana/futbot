const queue = []

export function request (url, config) {
  return new Promise((resolve, reject) => {
    const task = {
      url: encodeURI(`http://localhost:9998/${url}`),
      config: {
        headers: { 'Content-Type': 'application/json' },
        ...config
      },
      resolve,
      reject
    }
    queue.push(task)
  })
}

setInterval(queueWorker, 500)

function queueWorker () {
  const task = queue.shift()
  if (task) {
    const { url, config, resolve, reject } = task
    fetch(url, config)
      .then(d => {
        d.json()
          .then(data => resolve(data))
          .catch(e => reject(e))
      })
      .catch(e => reject(e))
  }
}

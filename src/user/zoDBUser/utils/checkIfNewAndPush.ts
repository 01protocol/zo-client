export function checkIfNewAndPush(arr, obj) {
  for (const el of arr) {
    let newEl = true
    for (const key in el) {
      if (el[key] != obj[key]) {
        newEl = false
        break
      }
    }
    if (newEl) return
  }
  arr.push(obj)
}

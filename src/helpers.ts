export function debounce (fn : Function, treshold : number) {
  let timer : number
  
  return function debounced (...args : Array<any>) {
  	window.clearTimeout(timer)

  	timer = window.setTimeout(() => {
    	fn(...args)
    }, treshold)
  }
}

// intentionaly not handling `this` - I don't want debounced callback to (ab)use `this`

export function trimStr (str : string) {
  return str.trim()
}
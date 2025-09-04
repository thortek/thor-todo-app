import './style.css'

//import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
   <h1>Welcome to my Todo App</h1>

   <button type="button" id="counter">Add a Category</button>

  </div>
`

/* setupCounter(document.querySelector<HTMLButtonElement>('#counter')!) */

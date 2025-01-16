//create a template element
const footerTemplate = document.createElement('template');
//create the element's style and html
footerTemplate.innerHTML = `
    <style>
        footer {
            box-sizing:border-box;
            display:inline-flex;
            flex-direction: row;
            justify-content: space-evenly;
            background-color: var(--navy);
            width:100%;
            padding:10px;
            margin:0px;
        }

        footer a {
            text-decoration: none;
            font-weight: bold;
            color:#ffffff;
        }

        footer a:hover {
            color:var(--gold);
        }
    </style>
    <footer>
        <a href="https://www.nwcs.k12.in.us/o/nhs" target="_blank">Norwell High School</a>
    </footer>
`;


class Footer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'closed'}); /*set mode 'open' to allow external js to change*/
    
        shadowRoot.appendChild(footerTemplate.content); //add our component to shadow dom
    }

}

customElements.define('footer-component', Footer); //html tag, class being used

/* 
TODO
-see how slots may be used: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots#adding_flexibility_with_slots
*/


/*
Code from:
Reusable HTML Components – How to Reuse a Header and Footer on a Website on FreeCodeCamp
https://www.freecodecamp.org/news/reusable-html-components-how-to-reuse-a-header-and-footer-on-a-website/
*/
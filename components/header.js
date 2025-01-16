const headerTemplate = document.createElement('template');

//notice link to QBOne.css to make class work...
headerTemplate.innerHTML = `
    <link rel="stylesheet" href="../css/QBOne.css">    
    <style>
        #fixed-nav {
            box-sizing:border-box;
            color: #ffffff;
            background-color: var(--lightNavy);
            padding:10px 15px;
            font-size: 24px;
            position:fixed;
            width:100%;
            top:0px;
            z-index: 2;
        }

        a {
            text-decoration:none;
            color:#fff;
        }
    </style>
    <header>
        <div id="fixed-nav" class="QBOne-Regular">
            <a href='../index.html'>Knights-Coding</a></div>
    </header>
`;


class Header extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'closed'}); /*set mode 'open' to allow external js to change*/
    
        shadowRoot.appendChild(headerTemplate.content);
    }

}

customElements.define('header-component', Header); //html tag, class being used

/* 
TODO
-see how slots may be used: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots#adding_flexibility_with_slots
*/


/*
Code from:
Reusable HTML Components – How to Reuse a Header and Footer on a Website on FreeCodeCamp
https://www.freecodecamp.org/news/reusable-html-components-how-to-reuse-a-header-and-footer-on-a-website/
*/
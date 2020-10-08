class UserController {
    
    constructor(formIdCreate, formIdUpdate, tableId) {
        this.formEl = document.getElementById(formIdCreate)
        this.formUpdateEl = document.getElementById(formIdUpdate)
        this.tableEl = document.getElementById(tableId) // Linha nova

        this.onSubmit()
        this.onEdit()
        this.selectAll()
    }

    onEdit() { // Evento do Botão cancelar. 

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e => {
            this.showPanelCreate()
        })

        this.formUpdateEl.addEventListener("submit", event => {
            event.preventDefault()

            let btn = this.formUpdateEl.querySelector("[type=submit]")

            btn.disabled = true

            let values = this.getValues(this.formUpdateEl)

            console.log(values)

            let index = this.formUpdateEl.dataset.trIndex
            
            let tr = this.tableEl.rows[index]

            let userOld = JSON.parse(tr.dataset.user)

            let result = Object.assign({}, userOld, values)

            this.getPhoto(this.formUpdateEl).then(

                (content) => {

                    if (!values.photo) {
                        result._photo = userOld._photo
                    } else {
                        result._photo = content
                    }

                    tr.dataset.user = JSON.stringify(result)

                    tr.innerHTML = `
            
                        <td><img src="${result._photo}" alt="User Image" class="img-circle img-sm"></td>
                        <td>${result._name}</td>
                        <td>${result._email}</td>
                        <td>${(result._admin ? 'Sim' : 'Não' )}</td>
                        <td>${Utils.dateFormat(result._register)}</td>
                        <td>
                            <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                            <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
                        </td>
                    `

            this.addEventsTR(tr)

            this.updateCount()
                                       
                    this.formUpdateEl.reset() // Limpa o formulário ao clicar no botão.

                    btn.disabled = false

                }, 

                e => {

                    console.error(e)

                }
            )
            
        })

    }

    // Sempre que o formulário for enviado o método vai ser chamado. Evento adiocionado ao botão.
    onSubmit() { // Será adicionado um novo usuário

        this.formEl.addEventListener("submit", event => {
    
            event.preventDefault() //comportamento padrão 

            let btn = this.formEl.querySelector("[type=submit]")

            btn.disabled = true

            let values = this.getValues(this.formEl)

            if(!values) return false



            this.getPhoto(this.formEl).then(

                content => {

                    values.photo = content

                    this.insert(values)

                    this.addLine(values) // O clique dispara a chamada do getValues e Adiciona a linha do usuário
                    
                    this.formEl.reset() // Limpa o formulário ao clicar no botão.

                    btn.disabled = false

                }, 

                e => {

                    console.error(e)

                }
            )
            
        })

    }

    getPhoto(formEl) {

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader()

            let elements = [...formEl.elements].filter(item=>{
                if (item.name === 'photo') {
                    return item // Retornará a imágem caso seja igual a 'photo'
                }
            })

        let file = elements[0].files[0] // Será selecionado apenas 1 arquivo

        // Callback. Quando terminar de carregar a imagem(onload), deverá executar a função.
        fileReader.onload = () => {
            
            resolve(fileReader.result)
            
        }

        fileReader.onerror = (e) => { // Caso dê erro no arquivo
            
            reject(e)

        }

        if (file){
            fileReader.readAsDataURL(file)
        } else {
            resolve('dist/img/boxed-bg.jpg')
        }

        })

        

    }

    getValues(formEl) {
            
            let user = {};
            let isValid = true;
            
            [...formEl.elements].forEach(function (field, index) {
                
                // -1 = Campo inexistente
                // Se for maior que -1, o campo está dentro dos critérios
                if(['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) { 

                    field.parentElement.classList.add('has-error')
                    isValid = false

                }

                if (field.name == "gender") {  
                    // Se a resposta da condição tiver apenas uma linha de código, pode ser feito assim
                    if(field.checked) {
                        user[field.name] = field.value
                    }
                    
                } else if ( field.name == "admin" ) {
        
                    user[field.name] = field.checked
        
                } else {
                    user[field.name] = field.value
                }
                
            })
        
            if(!isValid) {
                return false
            }

            return new User(
                user.name,
                user.gender,
                user.birth,
                user.country,
                user.email,
                user.password,
                user.photo,
                user.admin
            )
    }

    getUsersStorage() {
        let users = []

        if (localStorage.getItem("users")) {

            users = JSON.parse(localStorage.getItem("users"))

        }

        return users
    }

    selectAll() {

        let users = this.getUsersStorage()

        users.forEach(dataUser => {

            let user = new User()
            user.loadFromJSON(dataUser)
            this.addLine(user)

        })

    }

    insert(data) {

        let users = this.getUsersStorage()

        users.push(data)

        
        localStorage.setItem("users", JSON.stringify(users))

    }

        // View
    addLine(dataUser) {
            
            let tr = document.createElement('tr')


            tr.dataset.user = JSON.stringify(dataUser)

            tr.innerHTML = `
            <tr>
                <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
                <td>${dataUser.name}</td>
                <td>${dataUser.email}</td>
                <td>${(dataUser.admin ? 'Sim' : 'Não' )}</td>
                <td>${Utils.dateFormat(dataUser.register)}</td>
                <td>
                    <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                    <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
                </td>
            </tr>
            `;

            this.addEventsTR(tr)

            this.tableEl.appendChild(tr)

            this.updateCount()

            
    }

        // Eventos da tabela
    addEventsTR(tr) {

            tr.querySelector(".btn-delete").addEventListener("click", e => {

                if (confirm("Deseja realmente excluir? ")) {

                    tr.remove()

                    this.updateCount()
                }

            })

            tr.querySelector(".btn-edit").addEventListener("click", e => {
                
                let json = JSON.parse(tr.dataset.user)


                this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex

                // Passa os valores para o formulário
                for(let name in json) {

                    let field = this.formUpdateEl.querySelector("[name = " + name.replace("_", "") + "]")

                    if(field) {
                        switch(field.type) {
                            case 'file':
                                continue
                                break;

                            case 'radio':
                                field = this.formUpdateEl.querySelector("[name = " + name.replace("_", "") + "][value=" + json[name] + "]")
                                field.checked = true
                            break

                            case 'checkbox':
                                field.checked = json[name]
                                break
                            
                            default:
                                field.value = json[name]
                        }
                    }
                }

                this.formUpdateEl.querySelector(".photo").src = json._photo;

                // Ao clicar no botão editar
                this.showPanelUpdate()
            })

    }

    showPanelCreate() {
            document.querySelector("#box-user-create").style.display = "block" // Mostra o create
            document.querySelector("#box-user-update").style.display = "none" // Esconte o update
    }
        
        // Ao clicar no botão editar
    showPanelUpdate() {
            document.querySelector("#box-user-create").style.display = "none" // Esconte o create
            document.querySelector("#box-user-update").style.display = "block" // Mostra o update
    }

        // Ao clicar no botão cancelar
    updateCount(){

            let numberUsers = 0;
            let numberAdmin = 0;

            [...this.tableEl.children].forEach(tr => {

                numberUsers++


                let user = JSON.parse(tr.dataset.user)

                if (user._admin) numberAdmin++;
            })

            document.querySelector("#number-users").innerHTML = numberUsers
            document.querySelector("#number-users-admin").innerHTML = numberAdmin

    }
    
}

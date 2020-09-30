class UserController {
    
    constructor(formId, tableId) {
        this.formEl = document.getElementById(formId)
        this.tableEl = document.getElementById(tableId) // Linha nova

        this.onSubmit()
        this.onEdit()
    }

    onEdit() { // Evento do Botão cancelar. 

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e => {
            this.showPanelCreate()
        })

    }

    // Sempre que o formulário for enviado o método vai ser chamado. Evento adiocionado ao botão.
    onSubmit() {

        this.formEl.addEventListener("submit", event => {
    
            event.preventDefault() //comportamento padrão 

            let btn = this.formEl.querySelector("[type=submit]")

            btn.disabled = true

            let values = this.getValues()

            if(!values) return false



            this.getPhoto().then(

                content => {

                    values.photo = content

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

    getPhoto() {

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader()

            let elements = [...this.formEl.elements].filter(item=>{
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

    getValues() {
            
            let user = {};
            let isValid = true;
            
            [...this.formEl.elements].forEach(function (field, index) {
                
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
                <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
                </td>
            </tr>
            `;

            tr.querySelector(".btn-edit").addEventListener("click", e => {
                
                console.log(JSON.parse(tr.dataset.user))
                // Ao clicar no botão editar
                this.showPanelUpdate()
            })

            this.tableEl.appendChild(tr)

            this.updateCount()

            
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

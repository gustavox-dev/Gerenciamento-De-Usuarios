class UserController {
    
    constructor(formId, tableId) {
        this.formEl = document.getElementById(formId)
        this.tableEl = document.getElementById(tableId) // Linha nova

        this.onSubmit()
    }

    // Sempre que o formulário for enviado o método vai ser chamado. Evento adiocionado ao botão.
    onSubmit() {

        this.formEl.addEventListener("submit", event => {
    
            event.preventDefault() //comportamento padrão 

            let values = this.getValues()

            this.getPhoto().then(
                content => {

                    values.photo = content

                    this.addLine(values) // O clique dispara a chamada do getValues e Adiciona a linha do usuário   

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

        fileReader.readAsDataURL(file)

        })

        

    }

    getValues() {
            
            let user = {};
            
            [...this.formEl.elements].forEach(function (field, index) {
        
                if (field.name == "gender") {  
                    // Se a resposta da condição tiver apenas uma linha de código, pode ser feito assim
                    if(field.checked) {
                        user[field.name] = field.value
                    }
                    
                } else {
        
                    user[field.name] = field.value
        
                }
                
            })
        
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

        addLine(dataUser) {
            
            this.tableEl.innerHTML = `
                <tr>
                    <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
                    <td>${dataUser.name}</td>
                    <td>${dataUser.email}</td>
                    <td>${dataUser.admin}</td>
                    <td>${dataUser.birth}</td>
                    <td>
                    <button type="button" class="btn btn-primary btn-xs btn-flat">Editar</button>
                    <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
                    </td>
                </tr>
            `;
        }
    }

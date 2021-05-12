// This gallery shows coins images in pairs obverse/reverse

// "options.galleryNode": Must contains HTML nodes where "img" tags of every coin has an unique id in title attr ie: title=section_id 
//                        Every "img" tag must to be wrapped with an "a" node who contains href attr with full size pic
//                        Image caption <optional> can be putted in a data-caption attr inside "img" node

var image_gallery = {

    galleryListener : null,
    preButton : null,
    nextButton : null,
    popup : null,
    img1 : null,
    img2 : null,
    caption : null,
    galleryLength : null,
    currentIndex : 0,
    setup : {
        galleryPrimId : "popup-gallery",
        galleryNode : null,
        containerId : null               //if null put gallery in body
    },
        
    set_up : function(options) {
        const self = this
        //setup
        self.setup = {...self.setup, ...options}

        self.galleryListener = function(e){
            if (e.target.tagName == "IMG"){
                e.preventDefault()
                e.stopPropagation()
                self.OpenGallery(e)
            }
        }
        
        self.setup.galleryNode.addEventListener("click", self.galleryListener)

    },

    set_up_embedded : function (options){
         const self = this
        //setup
        self.setup = {...self.setup, ...options}
        galleryNode = self.setup.galleryNode
        this.currentIndex = 0

        

        const parsedGallery = self.ParseGallery(galleryNode)

        this.popup = document.createRange().createContextualFragment('<div id="'+self.setup.galleryPrimId+'"><div id="gallery-wrapper"><div class="nav-button" id="pre-button"></div><div id="images-wrapper"><img id="img1" src=""><img id="img2" src=""></div><div class="nav-button" id="next-button"></div></div></div>')

        this.img1 = this.popup.getElementById('img1')
        this.img2 = this.popup.getElementById('img2')

        //put first open images
        this.img1.src = parsedGallery[0][0].attributes.href.value
        this.img2.src = parsedGallery[0][1].attributes.href.value

        this.caption = ""
        this.preButton = this.popup.getElementById("pre-button")
        this.nextButton = this.popup.getElementById("next-button")
        
        //Set elements behaviour
        this.preButton.addEventListener("click", function(){self.SwitchPic(parsedGallery,-1)})
        this.nextButton.addEventListener("click", function(){self.SwitchPic(parsedGallery,1)})
        this.galleryLength = parsedGallery.length
        
        //Initialize nav buttons
        this.CheckNavButtons();

        document.getElementById(self.setup.containerId).appendChild(this.popup)

    },
 
    OpenGallery : function(e){
        const self = this

        galleryNode = self.setup.galleryNode

        let currentClick = e
        
        //Get clicked info of gallery
        const clickedTittle = currentClick.target.attributes.title.textContent
        
        //Get clicked image caption
        let clickedCaption
        if(currentClick.target.dataset.caption){
            clickedCaption = currentClick.target.dataset.caption
        } else {
            clickedCaption = ""
        }
        

        let imgNodes = galleryNode.getElementsByTagName('a')
        const parsedGallery = self.ParseGallery(imgNodes)
        
        for (let i=0;i<parsedGallery.length;i++){
            if (parsedGallery[i][0].children[0].attributes.title.textContent == clickedTittle){
                this.currentIndex = i
                break;
            }
        }
        
        //Generate popup html content
        this.popup = document.createRange().createContextualFragment('<div id="'+self.setup.galleryPrimId+'"><div id="gallery-wrapper"><div id="images-wrapper"><img id="img1" src=""><img id="img2" src=""></div><div id="caption-wrapper"><p>'+clickedCaption+'</p></div><div class="nav-button" id="pre-button"></div><div class="nav-button" id="next-button"></div></div></div>')
        
        //Get popup elements node
        this.img1 = this.popup.getElementById('img1')
        this.img2 = this.popup.getElementById('img2')

        //put first open images
        this.img1.src = parsedGallery[this.currentIndex][0].attributes.href.value
        this.img2.src = parsedGallery[this.currentIndex][1].attributes.href.value

        this.caption = this.popup.getElementById('caption-wrapper').getElementsByTagName('p')[0]
        this.preButton = this.popup.getElementById("pre-button")
        this.nextButton = this.popup.getElementById("next-button")
        
        //Set elements behaviour
        this.preButton.addEventListener("click", function(){self.SwitchPic(parsedGallery,-1)})
        this.nextButton.addEventListener("click", function(){self.SwitchPic(parsedGallery,1)})
        this.galleryLength = parsedGallery.length
        
        //Initialize nav buttons
        this.CheckNavButtons();
        
        //Append popup to DOM
        document.getElementsByTagName('body')[0].appendChild(this.popup)
        document.getElementById(self.setup.galleryPrimId).addEventListener("click", this.CloseGallery)
        
        
    },
    
    ParseGallery : function(imgNodes){
        let imgNodesArr = [].slice.call(imgNodes)
        imgNodesArr = imgNodesArr.filter(obj => obj.children.length>0)
        imgNodesArr = imgNodesArr.filter(obj => obj.children[0].title.length>0)

        let parsedGallery = []

        for (let i=0;i<imgNodesArr.length;i++){

                const currentTitle = imgNodesArr[i].children[0].attributes.title.textContent
                const elementsGroup = imgNodesArr.filter(obj => obj.children[0].attributes.title.textContent == currentTitle)
                                                         
                if(parsedGallery.length > 0){                                   
                    let findedInParsedGallery = parsedGallery.find(obj => obj[0].children[0].attributes.title.textContent == currentTitle)   
                    if (findedInParsedGallery == null){
                        parsedGallery.push(elementsGroup)
                    }       
                } else{
                    parsedGallery.push(elementsGroup)
                }
            
        }
        return parsedGallery
    },
    
    CloseGallery : function(e){
        if (e.target.classList.contains('nav-button')){
            e.stopPropagation()
        } else{
            document.getElementById('popup-gallery').remove()
        }
    },
    
    //Check current image to show/hide nav buttons
    CheckNavButtons : function(){
        if (this.galleryLength==1) {
            this.preButton.classList.add("hidden")
            this.nextButton.classList.add("hidden")
        } else {
            if(this.currentIndex == 0){
                this.preButton.classList.add("hidden");
                this.nextButton.classList.remove("hidden")
            } else if(this.galleryLength-1 == this.currentIndex){
                this.preButton.classList.remove("hidden");
                this.nextButton.classList.add("hidden");
            } else{
                this.preButton.classList.remove("hidden");
                this.nextButton.classList.remove("hidden");
            }
        }
    },

    SwitchPic : function(parsedGallery,increment){
        this.currentIndex += increment;

        let currentNode = parsedGallery[this.currentIndex]

        this.img1.src = currentNode[0].attributes.href.value
        this.img2.src = currentNode[1].attributes.href.value
        
        if(currentNode[0].children[0].dataset.caption){
            this.caption.textContent = currentNode[0].children[0].dataset.caption
        } else {
            this.caption.textContent = ""
        }
        this.CheckNavButtons()       
    },

    removeGallery : function(){
        const self = this
        self.setup.galleryNode.removeEventListener("click", self.galleryListener)
        delete this
    }  
}
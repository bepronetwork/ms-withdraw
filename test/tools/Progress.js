var now = require("performance-now")

var Multiprogress = require("multi-progress");
class Progress{


    constructor(){
        this.start = now();
        this.Bar = new Multiprogress(process.stdout);
    }

    addBar(length, string){
        return this.Bar.newBar(`${string} [:bar] :rate/bps :percent :etas`, 
        {   total: length, 
            complete: '■',
            incomplete: ' ', 
            width: 100
        });
    }
    
    tick(bar, quantity){
        bar.tick();
    }
    
    update(){
        this.Bar.update();
    }

    print(bar){
        /*var timer = setInterval(() => {
            if (bar.curr == bar.total) {
                console.log("Done updating this day, added bids")
              clearInterval(timer);
            }else{
                console.log( (parseInt(bar.curr) +' to ' +parseInt(bar.total)))
            }
        },60*1000);*/
    }
}

export default Progress;
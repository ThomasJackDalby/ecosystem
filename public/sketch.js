var chunks;
var STARTING_NUMBER_OF_CHUNKS = 10

function setup(){
    colorMode(HSL);
    createCanvas(1500, 700);
    chunks = [];
    for(var i=0;i<STARTING_NUMBER_OF_CHUNKS;i++){
        chunks[i] = new Chunk();
    }
}

function draw(){
    background(200, 100, 50);

    stroke(0);
    for(var i=0;i<chunks.length;i++){
        chunks[i].update();
        chunks[i].show();
    }
}

function check_chunk_collisions(){
    for(var i=0;i<chunks.length;i++){
        var a = chunks[i];
        for (var j=i+1;i<chunks.length;j++){
            var b = chunks[j];
            var d = (a.x-b.x)*(a.x-b.x)-(a.y-b.y)*(a.y-b.y);
            if (d < (a.radius+b.radius)*(a.radius+b.radius)){
                // Collide
                if (a.radius < b.radius){
                    a.eat(b);
                    chunks = chunks.slice(j, 1);
                }
            }
        }
    }
}


function Chunk(){
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(random(-2, 2), random(-2, 2));
    this.rpos = 0;
    this.rvel = 0;
    this.force = createVector(0, 0);
    this.torque = 0;
    this.mass = 100;
    this.cog = createVector(0, 0);
    this.moi = 1;
    this.radius = random(5, 30);
    this.friction = random(0, 1);
    this.points = create_polygon(0, 0, this.radius, random(3, 6));
    this.energy = 100;

    // View
    this.hue = 0;
    this.sat = random(20, 80);
    this.lightness = random(20, 80);

    this.update = function(){
        this.force.x = random(-5, 5);
        this.force.y = random(-5, 5);
        this.energy -= 0.01;
        this.torque = random(-0.01, 0.01);
        //this.evaluate_friction();
        this.integrate();
        this.wrap_position();
    }

    this.eat = function(other){
        this.energy += other.energy;
    }

    this.integrate = function(){
        this.vel.add(this.force.x/this.mass, this.force.y/this.mass);
        this.pos.add(this.vel);
        this.rvel += this.torque/this.moi;
        constrain(this.rvel,-2, 2);
        this.rpos += this.rvel;
        this.force.setMag(0);
        this.torque = 0;
    }

    this.evaluate_friction = function(){
        var f = createVector(-this.vel.x*1, -this.vel.y*1);
        this.force.add(f.x, f.y);
    }

    this.wrap_position = function(){
        var margin = 10;
        if (this.pos.x < -margin) this.pos.x = width+margin;
        if (this.pos.x > width+margin) this.pos.x = -margin;
        if (this.pos.y < -margin) this.pos.y = height+margin;
        if (this.pos.y > height+margin) this.pos.y = -margin;
    }

    this.show = function(){
        fill(this.hue, interp(this.energy, 0, 100, 0, 255), this.lightness);
        beginShape();
        var c = Math.cos(this.rpos);
        var s = Math.sin(this.rpos);
        for(var i=0;i<this.points.length;i++){
            var p = this.points[i];
            var x = c * p.x - s * p.y;
            var y = s * p.x + c * p.y;
            var tx = x + this.pos.x;
            var ty = y + this.pos.y;
            vertex(tx, ty);
        }
        endShape(CLOSE);
        pop();
    }
}

function interp(v, s_min, s_max, t_min, t_max){
    // ration of v/a / a/b
    m = (t_max - t_min)/(s_max - s_min);
    return m * (v - s_min) + t_min;

}

function create_polygon(x, y, radius, npoints) {
    var angle = TWO_PI / npoints;
    var points = []
    for (var a = 0; a < TWO_PI; a += angle) {
        var sx = x + cos(a) * radius;
        var sy = y + sin(a) * radius;
        points.push(createVector(sx, sy));
    }
    return points;
}


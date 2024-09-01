let fishes = [];
const numFishes = 14; // Initial number of fishes
const normalSteeringSensitivity = 0.02; // Sensitivity for random steering
const aggressiveSteeringSensitivity = 0.1; // More aggressive steering towards bait
const baitRadius = 5; // Radius of the bait
let baits = []; // Array to store bait objects

function setup() {
  createCanvas(1700, 900); // Set up canvas
  noStroke();

  // Create the initial fish objects
  for (let i = 0; i < numFishes; i++) {
    fishes.push(new Fish(random(width), random(height)));
  }
}

function draw() {
  background(20, 100, 200); // Blue background representing water

  // Update and display each fish
  for (let fish of fishes) {
    fish.update();
    fish.display();

    // Check if the fish reaches any bait
    for (let j = baits.length - 1; j >= 0; j--) {
      let bait = baits[j];
      if (dist(fish.position.x, fish.position.y, bait.position.x, bait.position.y) < fish.size / 2 + baitRadius) {
        fish.grow(); // Make the fish grow when it eats bait
        baits.splice(j, 1); // Remove the bait
        break; // Break out of the loop after catching bait
      }
    }
  }

  // Display baits
  for (let bait of baits) {
    bait.display();
  }
}

function mousePressed() {
  // Drop bait at the mouse position on click
  baits.push(new Bait(mouseX, mouseY));
}

class Fish {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.size = random(20, 50); // Random size for variation
    this.color = color(random(100, 255), random(100, 255), random(100, 255)); // Random color
    this.speed = random(1, 3); // Random speed
    this.angle = random(TWO_PI); // Random initial direction
    this.steering = 0;
    this.jiggleOffset = random(1000); // Offset for jiggle to ensure each fish moves differently
  }

  update() {
    if (baits.length > 0) {
      // Find the closest bait
      let closestBait = baits[0];
      let closestDistance = dist(this.position.x, this.position.y, closestBait.position.x, closestBait.position.y);
      for (let bait of baits) {
        let d = dist(this.position.x, this.position.y, bait.position.x, bait.position.y);
        if (d < closestDistance) {
          closestDistance = d;
          closestBait = bait;
        }
      }

      // Move aggressively towards the closest bait
      let desiredDirection = p5.Vector.sub(closestBait.position, this.position).heading();
      let steeringAngle = desiredDirection - this.angle;
      this.angle += constrain(steeringAngle, -aggressiveSteeringSensitivity, aggressiveSteeringSensitivity);
    } else {
      // Randomly adjust the steering angle when there is no bait
      if (random(1) < 0.05) {
        this.steering = random(-normalSteeringSensitivity, normalSteeringSensitivity);
      }
      this.angle += this.steering;
    }

    // Calculate velocity based on angle and speed
    let velocity = p5.Vector.fromAngle(this.angle).mult(this.speed);
    this.position.add(velocity);

    // Wrap around the edges of the canvas
    if (this.position.x < 0) this.position.x = width;
    if (this.position.x > width) this.position.x = 0;
    if (this.position.y < 0) this.position.y = height;
    if (this.position.y > height) this.position.y = 0;
  }

  grow() {
    this.size *= 1.1; // Increase the fish size by 10%
  }

  display() {
    let jiggle = sin(frameCount * 0.2 + this.jiggleOffset) * (this.size / 4); // Jiggle effect

    fill(this.color);
    push();
    translate(this.position.x, this.position.y);
    rotate(this.angle);

    // Draw the body of the fish
    ellipse(0, 0, this.size + jiggle, this.size / 2); // Jiggle the body slightly

    // Draw the tail fin with a jiggle effect
    let tailJiggle = sin(frameCount * 0.2 + this.jiggleOffset) * (this.size / 4);
    fill(this.color.levels[0] * 0.8, this.color.levels[1] * 0.8, this.color.levels[2] * 0.8); // Darker tail color
    triangle(
      -this.size / 2, 0,
      -this.size - tailJiggle, -this.size / 4,
      -this.size - tailJiggle, this.size / 4
    );

    // Draw side fins
    fill(this.color.levels[0] * 0.9, this.color.levels[1] * 0.9, this.color.levels[2] * 0.9); // Slightly darker side fins
    triangle(
      this.size / 4, -this.size / 4,
      this.size / 8, -this.size / 2,
      0, -this.size / 4
    );
    triangle(
      this.size / 4, this.size / 4,
      this.size / 8, this.size / 2,
      0, this.size / 4
    );

    // Draw eyes on the fish
    fill(255); // White of the eye
    ellipse(this.size / 4, -this.size / 8, this.size / 8, this.size / 8);
    ellipse(this.size / 4, this.size / 8, this.size / 8, this.size / 8);

    fill(0); // Pupil
    ellipse(this.size / 4 + this.size / 16, -this.size / 8, this.size / 16, this.size / 16);
    ellipse(this.size / 4 + this.size / 16, this.size / 8, this.size / 16, this.size / 16);

    pop();
  }
}

class Bait {
  constructor(x, y) {
    this.position = createVector(x, y);
  }

  display() {
    fill(139, 69, 19); // Brown color for the bait
    ellipse(this.position.x, this.position.y, baitRadius * 2, baitRadius * 2);
  }
}

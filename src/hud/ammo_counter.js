// goog.provide('UpdatingWriter');

// goog.require('Widget');


// /**
//  * @constructor
//  * @extends {Widget}
//  * @struct
//  */
// UpdatingWriter = function(x, y, textFunction) {
//   goog.base(this, x, y);
//   this.textFunction = textFunction;

//   this.font = 'bold 28px courier';
//   this.fillStyle = '#00F';
// };
// goog.inherits(UpdatingWriter, Widget);


// UpdatingWriter.prototype.render = function() {
//   this.setFont(this.font);
//   this.setFillStyle(this.fillStyle);
//   this.context.fillText(this.textFunction(),
//       this.position[0], this.position[1]);
// };

UpdatingWriter = function(x, y, textFunction) {
  goog.base(this, x, y);
  this.textFunction = textFunction;
};
goog.inherits(UpdatingWriter, Widget);


UpdatingWriter.prototype.render = function() {
  this.setFont('bold 28px courier');
  this.setFillStyle('#00F');
  this.context.fillText(this.textFunction(),
      this.position[0], this.position[1]);
};

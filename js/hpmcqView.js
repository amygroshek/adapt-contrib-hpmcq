define([
    'core/js/adapt',
    'core/js/views/questionView'
], function(Adapt, QuestionView) {

    var HpmcqView = QuestionView.extend({

        events: {
            'focus .hpmcq-item input':'onItemFocus',
            'blur .hpmcq-item input':'onItemBlur',
            'change .hpmcq-item input':'onItemSelected',
            'keyup .hpmcq-item input':'onKeyPress'
        },

        resetQuestionOnRevisit: function() {
            this.setAllItemsEnabled(true);
            this.resetQuestion();
        },

        setupQuestion: function() {
            this.model.setupRandomisation();
        },

        disableQuestion: function() {
            this.setAllItemsEnabled(false);
        },

        enableQuestion: function() {
            this.setAllItemsEnabled(true);
        },

        setAllItemsEnabled: function(isEnabled) {
            _.each(this.model.get('_items'), function(item, index){
                var $itemLabel = this.$('label').eq(index);
                var $itemInput = this.$('input').eq(index);

                if (isEnabled) {
                    $itemLabel.removeClass('disabled');
                    $itemInput.prop('disabled', false);
                } else {
                    $itemLabel.addClass('disabled');
                    $itemInput.prop('disabled', true);
                }
            }, this);
        },

        onQuestionRendered: function() {
            this.setReadyStatus();
            if (!this.model.get("_isSubmitted")) return;
            this.showMarking();
        },

        onKeyPress: function(event) {
            if (event.which === 13) { //<ENTER> keypress
                this.onItemSelected(event);
            }
        },

        onItemFocus: function(event) {
            if(this.model.get('_isEnabled') && !this.model.get('_isSubmitted')){
                $("label[for='"+$(event.currentTarget).attr('id')+"']").addClass('highlighted');
            }
        },

        onItemBlur: function(event) {
            $("label[for='"+$(event.currentTarget).attr('id')+"']").removeClass('highlighted');
        },

        onItemSelected: function(event) {
            if(this.model.get('_isEnabled') && !this.model.get('_isSubmitted')){
                var selectedItemObject = this.model.get('_items')[$(event.currentTarget).parent('.component-item').index()];
                this.toggleItemSelected(selectedItemObject, event);
            }
        },

        toggleItemSelected:function(item, clickEvent) {
            var selectedItems = this.model.get('_selectedItems');
            var itemIndex = _.indexOf(this.model.get('_items'), item),
                $itemLabel = this.$('label').eq(itemIndex),
                $itemInput = this.$('input').eq(itemIndex),
                selected = !$itemLabel.hasClass('selected');

                if(selected) {
                    if(this.model.get('_selectable') === 1){
                        this.$('label').removeClass('selected');
                        this.$('input').prop('checked', false);
                        this.deselectAllItems();
                        selectedItems[0] = item;
                    } else if(selectedItems.length < this.model.get('_selectable')) {
                     selectedItems.push(item);
                 } else {
                    clickEvent.preventDefault();
                    return;
                }
                $itemLabel.addClass('selected');
            } else {
                selectedItems.splice(_.indexOf(selectedItems, item), 1);
                $itemLabel.removeClass('selected');
            }
            $itemInput.prop('checked', selected);
            item._isSelected = selected;
            this.model.set('_selectedItems', selectedItems);
            // this.model.setupFeedback();
            // this.model.showFeedback();
            if (this.model.get('_canShowFeedback')) {
                this.model.setupFeedback();
                Adapt.trigger('questionView:showFeedback', this);
                this.showMarking();
                // this.setQuestionAsSubmitted();
                // this.markQuestion();
                // this.setScore();
            } else {
                // Adapt.trigger('questionView:disabledFeedback', this);
            }
        },

        // Blank method to add functionality for when the user cannot submit
        // Could be used for a popup or explanation dialog/hint
        onCannotSubmit: function() {},

        // This is important and should give the user feedback on how they answered the question
        // Normally done through ticks and crosses by adding classes
        showMarking: function() {
            // console.log('hpmcqView showMarking()');
            if (!this.model.get('_canShowMarking')) return;
            // console.log('_canShowMarking === true');
            _.each(this.model.get('_items'), function(item, i) {
                var $item = this.$('.component-item').eq(i);
                $item.removeClass('correct incorrect').addClass(item._isCorrect ? 'correct' : 'incorrect');
            }, this);
        },

        // Used by the question view to reset the look and feel of the component.
        resetQuestion: function() {
            this.deselectAllItems();
            this.resetItems();
        },

        deselectAllItems: function() {
            this.model.deselectAllItems();
        },

        resetItems: function() {
            this.$('.component-item label').removeClass('selected');
            this.$('.component-item').removeClass('correct incorrect');
            this.$('input').prop('checked', false);
            this.model.resetItems();
        },

        showCorrectAnswer: function() {
            _.each(this.model.get('_items'), function(item, index) {
                this.setOptionSelected(index, item._shouldBeSelected);
            }, this);
        },

        setOptionSelected:function(index, selected) {
            var $itemLabel = this.$('label').eq(index);
            var $itemInput = this.$('input').eq(index);
            if (selected) {
                $itemLabel.addClass('selected');
                $itemInput.prop('checked', true);
            } else {
                $itemLabel.removeClass('selected');
                $itemInput.prop('checked', false);
            }
        },

        hideCorrectAnswer: function() {
            _.each(this.model.get('_items'), function(item, index) {
                this.setOptionSelected(index, this.model.get('_userAnswer')[item._index]);
            }, this);
        }
    });

    return HpmcqView;

});

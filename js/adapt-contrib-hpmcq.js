define([
    'core/js/adapt',
    './hpmcqView',
    './hpmcqModel'
], function(Adapt, HpmcqView, HpmcqModel) {

    return Adapt.register("hpmcq", {
        view: HpmcqView,
        model: HpmcqModel
    });

});

(function(exports) {

    /*
     * Client to server: clicked on pawn    
     */
    exports.T_CLICK_ON_PAWN = "CLICK-ON-PAWN";
    exports.O_CLICK_ON_PAWN = {
        type: exports.T_CLICK_ON_PAWN,
        data: null
    };

}(typeof exports === "undefined" ? this.Messages = {} : exports));
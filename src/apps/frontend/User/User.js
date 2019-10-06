/**
 * Checks if the user can access the requested resource
 * @return {Boolean} Returns true if the user can access
 * @author Manuel Mayrhofer
 */
User.prototype.canAccess = function(){
    if (!this.active) {
        return false;
    }

    if(path.length >= 2 && path[2]._prototype === "Club") {
        //if the user belongs to a club, he can only access the own one
        if(this.club) {
            if(path[2] == this.club) {
                return true;
            }
        }
        return false;
    }
};
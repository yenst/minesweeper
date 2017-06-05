
function Coord(r, c) {
    this.r = r;
    this.c = c;
}

Coord.prototype.neighbours = function*() {
    for (let i = -1; i <= 1; i++)
        for (let j = -1; j <= 1; j++)
            if (j !== 0 || i !== 0)
                yield new Coord(this.r + i, this.c + j);
};

/*
 Coord.prototype.neighbours = function(){

 let res = [];
 for (let i=-1; i<=1 ; i++)
 for (let j=-1; j<=1 ; j++)
 if ( j!==0 || i!==0 )
 res.push( new Coord(this.r+i,this.c+j) );
 return res;
 };
 */

function MinesweeperCell(field, coord) {
    this.coord = coord;
    this.field = field;

    this.bomb = false;
    this.flag = false;
    this.accessed = false;
}

MinesweeperCell.prototype.neighbours = function () {
    return Array.from(this.coord.neighbours())
        .filter(c => this.field.isValidCoord(c))
        .map(c => this.field.get(c));
};

function MinesweeperField(rows, cols) {
    this.rows = rows;
    this.cols = cols;

    this.minefield = new Array(rows);
    for (let r = 0; r < rows; r++) {
        this.minefield[r] = new Array(cols);
        for (let c = 0; c < cols; c++) {
            this.minefield[r][c] = new MinesweeperCell(this, new Coord(r, c));
        }
    }
}

MinesweeperField.prototype.get = function (r, c) {
    if (r instanceof Coord) {
        let coord = r;
        return this.get(coord.r, coord.c);
    } else {
        return this.minefield[r][c];
    }
};

MinesweeperField.prototype.isValidCoord = function (coord) {
    let r = coord.r;
    let c = coord.c;
    return r >= 0 && c >= 0 && r < this.rows && c < this.cols;
};

MinesweeperField.prototype.getRandomCell = function () {
    return this.get(
        Math.floor((Math.random() * this.rows)),
        Math.floor((Math.random() * this.cols))
    );
};

function Minesweeper(rows, cols, bombCount) {
    this.field = new MinesweeperField(rows, cols);

    for (let i = 0; i < bombCount; i++) {
        this.field.getRandomCell().bomb = true;
    }

    this.countBombsAround = function (cell) {
        return cell.neighbours().filter(c => c.bomb).length;
    };

    this.access = function (r, c, user) {
        function createCmd(cmd) { return {r: r, c: c, user: user, cmd: cmd}; }
        function createClearCmd(cmd, bombsAround) {
            let temp = createCmd(cmd);
            temp.bombsAround = bombsAround;
            return temp;
        }
        console.log("access",r,c);
        let thisMinesweeper = this;
        let cell = this.field.get(r,c);
        if (cell.accessed) {
            if (cell.flag === user) {
                cell.accessed = false;
                cell.flag = false;
                return [createCmd("removeFlag")];
            } else {
                return [];
            }
        } else if (cell.bomb) {
            return [createCmd("revealBomb")];
        } else {
            let bombsAround = this.countBombsAround(cell);
            cell.accessed = user;
            let res = [createClearCmd("clear",bombsAround)];
            if (bombsAround == 0) {
                return cell.neighbours()
                    .filter(c=>!c.flag)
                    .reduce(
                        ((res,c)=>res.concat(thisMinesweeper.access(c.coord.r, c.coord.c, user))),
                        res
                    );
            } else {
                return res;
            }
        }
    };

    this.plantFlag = function (r, c, user) {
        let cell = this.field.get(r,c);
        if (cell.accessed)  return [];

        cell.accessed = user;
        cell.flag = user;
        return [{r: r, c: c, user: user, cmd: "plantFlag"}];
    }
}

module.exports = Minesweeper;
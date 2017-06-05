"use strict";

$(function () {



    MinesweeperGUI.prototype.getCell = function (r, c) {
        return $('#' + tdId(r, c));
    };

    MinesweeperGUI.prototype.handleServerResponse = function (e) {
        let cell = this.getCell(e.r, e.c);
        switch (e.cmd) {
            case "clear":
                return this.revealClear(cell, e.bombsAround);
            case "plantFlag":
                return this.plantFlag(cell, e.user);
            case "removeFlag":
                return this.removeFlag(cell, e.user);
            case "revealBomb":
                return this.revealBomb(cell, e.user);
            default:
                console.log(e.cmd);
        }
    };

    MinesweeperGUI.prototype.leftClick = function (r, c) {
        console.log("leftClick " + r + " " + c);
        socket.emit('clientAccess',{row:r,col:c,user:"user1"});

    };

    MinesweeperGUI.prototype.rightClick = function (r, c) {
        console.log("rightClick " + r + " " + c);
        socket.emit('clientPlantFlag',{row:r,col:c,user:"user1"});


    };

    MinesweeperGUI.prototype.plantFlag = function (cell, user) {
        cell.removeClass("init");
        cell.addClass("flag");
        cell.css('background-color', "red");
    };

    MinesweeperGUI.prototype.removeFlag = function (cell) {
        cell.removeClass("flag");
        cell.addClass("init");
        cell.css('background-color', '');
    };

    MinesweeperGUI.prototype.revealBomb = function (cell) {
        cell.removeClass("init");
        cell.addClass("bomb");
        cell.css('background-color', "red");
    };

    MinesweeperGUI.prototype.revealClear = function (cell, count) {
        cell.removeClass("init");
        cell.addClass("clear");
        cell.text(count);
        cell.css("color", NUMBER_COLOR[count]);
    };

    function MinesweeperGUI(rows, cols, user) {
        this.rows = rows;
        this.cols = cols;

        let thisGUI = this;

        let $minefield = $('#minefield');
        for (let r = 0; r < this.rows; r++) {
            let $row = $('<tr></tr>');
            for (let c = 0; c < this.cols; c++) {
                let $cell = $("<td></td>");
                $cell.addClass("cell");
                $cell.addClass("init");
                $cell.attr('id', tdId(r, c));
                $cell.mousedown(this.createMouseDownHandler(r, c));
                $row.append($cell);
            }
            $minefield.append($row);
        }

        $minefield.bind('contextmenu', e => false);


        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                //this.getCell(r, c).mousedown(this.createMouseDownHandler(r, c));
            }
        }


    }

    function tdId(r, c) {
        return 'cell-' + r + '-' + c;
    }

    MinesweeperGUI.prototype.createMouseDownHandler = function (r, c) {
        let thisGUI = this;
        return function (event) {
            switch (event.which) {
                case 1:
                    thisGUI.leftClick(r, c);
                    break;
                case 3:
                    thisGUI.rightClick(r, c);
                    break;
            }
        };
    };

    let NUMBER_COLOR = ["white", "black", "red", "green", "yellow", "blue", "yellow", "pink"];


    let client;


    let socket = io();

    socket.on('gameCreated',function(data){
        client = new MinesweeperGUI(data.rows, data.cols);

    });

    socket.on('serverResponse',function(data){
        client.handleServerResponse(data);
    })
});
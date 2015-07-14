var expect = require('chai').expect;
var feed = require("../index");

describe('GitHubActivity ~', function() {
    var gully = null;

    beforeEach(function() {
        gully = new feed('gullyfoyle');
    });

    describe('When we create a new object', function() {
        it('should be of type GitHubAtivity', function() {

            expect(gully).to.be.an.instanceof(feed);

        });
    });

    describe('When we call the fetch() method', function() {
        
        it('should respond to .fetch()', function() {

            expect(gully).to.respondTo('fetch');

        });
        
        it('should return data for a valid user', function(done) {
            
            gully.fetch(function(err, data) {

                expect(err).to.be.null;
                expect(data).to.exist;
                expect(data).to.have.length.within(1,30);
                done();
            });

        });
        
        it('should return an error for an invalid user', function(done) {
            
            gully = new feed('gully666foyle');
            gully.fetch(function(err, data) {

                expect(err).to.exist;
                expect(data).to.be.null;
                done();
            });

        });
        
    });
    
    
    describe('When we call the stream() method', function() {
        
        it('should respond to .stream()', function() {

            expect(gully).to.respondTo('stream');

        });
        
        it('should return data for a valid user', function(done) {

            var count = 0;
            gully.stream();
            gully.on('item', function(item) {
                expect(item).to.exist;
                ++count;
            });
            
            gully.on('error', function(error) {
                expect(error).to.be.null;
            });
            
            gully.on('end', function() {
                expect(count).to.be.within(1,30);
                done();
            });
        });
        
        it('should return an error for an invalid user', function(done) {

            gully.stream();
            gully.on('item', function(item) {
                expect(item).to.be.null;
            });
            
            gully.on('error', function(error) {
                expect(error).to.exist;
            });
            
            gully.on('end', function() {
                done();
            });
        });
    });
    
    
});
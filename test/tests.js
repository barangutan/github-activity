var expect = require('chai').expect;
var activity = require("../index");

describe('GitHubActivity ~', function() {

    describe('When we call the fetch() method', function() {
        
        it('should respond to .fetch()', function() {

            expect(activity).to.respondTo('fetch');

        });
        
        it('should return data for a valid user', function(done) {
            
            activity.fetch('barangutan', function(err, data) {

                expect(err).to.be.null;
                expect(data).to.exist;
                expect(data).to.have.length.within(1,30);
                done();
            });

        });
        
        it('should return an error for an invalid user', function(done) {
            
            activity.fetch('barangutan666', function(err, data) {

                expect(err).to.exist;
                expect(data).to.be.null;
                done();
            });

        });
        
    });
    
    
    describe('When we call the stream() method', function() {
        
        it('should respond to .stream()', function() {

            expect(activity).to.respondTo('stream');

        });
        
        it('should return data for a valid user', function(done) {

            var count = 0;
            activity.stream('barangutan');
            activity.on('item', function(item) {
                expect(item).to.exist;
                ++count;
            });
            
            activity.on('error', function(error) {
                expect(error).to.be.null;
                done();
            });
            
            activity.on('end', function() {
                expect(count).to.be.within(1,30);
                done();
            });
        });
        
        it('should return an error for an invalid user', function(done) {
            activity.stream('barangutan666');
            
            activity.on('error', function(error) {
                expect(error).to.exist;
                done();
            });
            
            activity.on('end', function() {
                done();
            });
        });
    });
    
    
});
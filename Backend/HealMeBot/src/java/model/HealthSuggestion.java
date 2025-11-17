package model;

public class HealthSuggestion {
    private int age;
    private double height;
    private double weight;
    private String healthIssues;
    private String suggestions;

    // Getters and setters
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public double getHeight() { return height; }
    public void setHeight(double height) { this.height = height; }

    public double getWeight() { return weight; }
    public void setWeight(double weight) { this.weight = weight; }

    public String getHealthIssues() { return healthIssues; }
    public void setHealthIssues(String healthIssues) { this.healthIssues = healthIssues; }

    public String getSuggestions() { return suggestions; }
    public void setSuggestions(String suggestions) { this.suggestions = suggestions; }
}
